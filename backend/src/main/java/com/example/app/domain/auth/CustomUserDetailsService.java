package com.example.app.domain.auth;

import com.example.app.domain.user.Role;
import com.example.app.domain.user.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public CustomUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.example.app.domain.user.User user = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Role role = user.getRole() == null ? Role.ATTENDEE : user.getRole();

        return User.builder()
                .username(user.getEmail())
                .password(user.getHashedPassword())
                .roles(role.name())
                .build();
    }
}

