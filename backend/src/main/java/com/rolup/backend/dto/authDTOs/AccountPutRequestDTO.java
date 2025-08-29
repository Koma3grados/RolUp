package com.rolup.backend.dto.authDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AccountPutRequestDTO {
    private String username;
    private String currentPassword;
    private String newPassword;
}
