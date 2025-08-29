package com.rolup.backend.service;

import com.rolup.backend.config.security.JwtTokenProvider;
import com.rolup.backend.dto.authDTOs.AccountPutRequestDTO;
import com.rolup.backend.dto.authDTOs.AccountRegisterLoginRequestDTO;
import com.rolup.backend.dto.authDTOs.AccountResponseDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.model.Account;
import com.rolup.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final JwtTokenProvider tokenProvider;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AccountResponseDTO registerAccount(AccountRegisterLoginRequestDTO dto) {
        if (accountRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new BadRequestException("Username already exists");
        }

        Account account = new Account();
        account.setUsername(dto.getUsername());
        account.setPassword(passwordEncoder.encode(dto.getPassword()));
        account.setAdmin(false);
        account.setCharacters(null);

        Account saved = accountRepository.save(account);
        String token = tokenProvider.createToken(saved.getUsername(), saved.isAdmin());

        return new AccountResponseDTO(saved.getId(), saved.getUsername(), saved.isAdmin(), token);
    }

    public List<AccountResponseDTO> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accounts.stream()
                .map(account -> new AccountResponseDTO(
                        account.getId(),
                        account.getUsername(),
                        account.isAdmin(),
                        null)) // No generamos token para listas
                .collect(Collectors.toList());
    }

    public AccountResponseDTO getAccountByUsername(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));
        String token = tokenProvider.createToken(account.getUsername(), account.isAdmin());
        return new AccountResponseDTO(account.getId(), account.getUsername(), account.isAdmin(), token);
    }

    public AccountResponseDTO updateAccount(String currentUsername, AccountPutRequestDTO dto) {
        Account account = accountRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));

        // Verificar contraseña actual
        if (dto.getCurrentPassword() == null || !passwordEncoder.matches(dto.getCurrentPassword(), account.getPassword())) {
            throw new BadRequestException("Contraseña actual incorrecta");
        }

        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            account.setUsername(dto.getUsername());
        }

        if (dto.getNewPassword() != null && !dto.getNewPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        Account updated = accountRepository.save(account);
        String token = tokenProvider.createToken(updated.getUsername(), updated.isAdmin());

        return new AccountResponseDTO(updated.getId(), updated.getUsername(), updated.isAdmin(), token);
    }

    public void resetPassword(String username, String newPassword) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));

        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }

    public void deleteAccount(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));

        accountRepository.delete(account);
    }
}
