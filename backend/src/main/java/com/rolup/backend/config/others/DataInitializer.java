package com.rolup.backend.config.others;

import com.rolup.backend.model.Account;
import com.rolup.backend.repository.AccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    // Creamos la única cuenta de admin que existirá en la base de datos, la cuenta del Dungeon Master
    @Bean
    public CommandLineRunner createAdminIfNotExists(AccountRepository accountRepository) {
        return args -> {
            if (accountRepository.findByUsername("DM").isEmpty()) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                Account admin = new Account();
                admin.setUsername("DM");
                admin.setPassword(encoder.encode("DM"));
                admin.setAdmin(true);
                accountRepository.save(admin);
                System.out.println("Admin creado");
            }
        };
    }
}
