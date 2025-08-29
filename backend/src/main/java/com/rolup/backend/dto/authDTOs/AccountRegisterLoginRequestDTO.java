package com.rolup.backend.dto.authDTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountRegisterLoginRequestDTO {
    private String username;
    private String password;
}
