package com.example.clinicalordering.config;

import static com.example.clinicalordering.config.ApplicationSecurityProperties.SecurityMode.OAUTH2;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableConfigurationProperties(ApplicationSecurityProperties.class)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ApplicationSecurityProperties securityProperties
    ) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(Customizer.withDefaults());

        if (securityProperties.getMode() == OAUTH2) {
            http.authorizeHttpRequests(authorize -> authorize
                    .requestMatchers("/h2-console/**").permitAll()
                    .anyRequest().authenticated());
            http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        } else {
            http.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
        }

        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        return http.build();
    }
}

