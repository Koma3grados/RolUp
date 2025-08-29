package com.rolup.backend.dto.authDTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
public class AccountResponseDTO {
    private Long id;
    private String username;
    private boolean isAdmin;
    private String token;
}
