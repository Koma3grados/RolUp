package com.rolup.backend.config.security;

import com.rolup.backend.dto.authDTOs.AccountResponseDTO;
import com.rolup.backend.dto.authDTOs.AccountRegisterLoginRequestDTO;
import com.rolup.backend.exception.BadRequestException;
import com.rolup.backend.exception.InvalidCredentialsException;
import com.rolup.backend.exception.NotFoundException;
import com.rolup.backend.exception.PasswordMismatchException;
import com.rolup.backend.model.Account;
import com.rolup.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AccountRepository accountRepository;

    @PostMapping("/login")
    public ResponseEntity<AccountResponseDTO> login(@RequestBody AccountRegisterLoginRequestDTO request) {
        try {
            // Primero verificar si el usuario existe
            Optional<Account> optionalAccount = accountRepository.findByUsername(request.getUsername());

            if (optionalAccount.isEmpty()) {
                throw new NotFoundException("Usuario no encontrado: " + request.getUsername());
            }

            // Intentar autenticar (esto lanzará BadCredentialsException si la contraseña es incorrecta)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Si la autenticación fue exitosa, obtener el account completo
            Account account = optionalAccount.get();
            String token = tokenProvider.createToken(account.getUsername(), account.isAdmin());
            AccountResponseDTO response = new AccountResponseDTO(account.getId(), account.getUsername(), account.isAdmin(), token);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Si llegamos aquí, el usuario existe pero la contraseña es incorrecta
            throw new PasswordMismatchException("Contraseña incorrecta para el usuario: " + request.getUsername());
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Credenciales inválidas");
        }
    }
}