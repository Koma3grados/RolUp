package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.dto.authDTOs.AccountPutRequestDTO;
import com.rolup.backend.dto.authDTOs.AccountRegisterLoginRequestDTO;
import com.rolup.backend.dto.authDTOs.AccountResponseDTO;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    // Se registra una cuenta con nombre y contraseña (quizá deba cambiarse para que sea el DM quien crea las cuentas de los jugadores)
    @PostMapping("/register")
    public ResponseEntity<AccountResponseDTO> register(@RequestBody AccountRegisterLoginRequestDTO dto) {
        return ResponseEntity.ok(accountService.registerAccount(dto));
    }

    // Obtiene todas las cuentas (solo admin)
    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> getAllAccounts(Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden ver todas las cuentas.");
        }
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    // Obtiene una cuenta, la del jwt
    @GetMapping("/me")
    public ResponseEntity<AccountResponseDTO> getMyAccount(Authentication auth) {
        return ResponseEntity.ok(accountService.getAccountByUsername(auth.getName()));
    }

    // Obtiene una cuenta específica por username (solo admin)
    @GetMapping("/{username}")
    public ResponseEntity<AccountResponseDTO> getAccountByUsername(@PathVariable String username, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden ver otras cuentas.");
        }
        return ResponseEntity.ok(accountService.getAccountByUsername(username));
    }

    // Modifica la cuenta
    @PutMapping("/me")
    public ResponseEntity<AccountResponseDTO> updateMyAccount(@RequestBody AccountPutRequestDTO dto,
                                                              Authentication auth) {
        return ResponseEntity.ok(accountService.updateAccount(auth.getName(), dto));
    }

    // Cambia la contraseña de cualquier cuenta (solo admin - para resetear contraseñas)
    @PatchMapping("/{username}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable String username,
                                                @RequestBody AccountPutRequestDTO dto,
                                                Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden resetear contraseñas.");
        }
        accountService.resetPassword(username, dto.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }

    // Elimina una cuenta
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyAccount(Authentication auth) {
        accountService.deleteAccount(auth.getName());
        return ResponseEntity.ok("Cuenta eliminada correctamente");
    }

    // Elimina cualquier cuenta (solo admin)
    @DeleteMapping("/{username}")
    public ResponseEntity<String> deleteAccount(@PathVariable String username, Authentication auth) {
        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar otras cuentas.");
        }
        accountService.deleteAccount(username);
        return ResponseEntity.ok("Cuenta eliminada correctamente");
    }
}
