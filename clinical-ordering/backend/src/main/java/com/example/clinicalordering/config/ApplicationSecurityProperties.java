package com.example.clinicalordering.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class ApplicationSecurityProperties {

    private SecurityMode mode = SecurityMode.DISABLED;

    public SecurityMode getMode() {
        return mode;
    }

    public void setMode(SecurityMode mode) {
        this.mode = mode;
    }

    public enum SecurityMode {
        DISABLED,
        OAUTH2
    }
}

