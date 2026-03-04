package com.twotwo.ssadagu.domain.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @Column(name = "rt_key") // Contains the userId
    private String key;

    @Column(name = "rt_value", nullable = false) // Contains the refresh token
    private String value;

    public RefreshToken updateValue(String token) {
        this.value = token;
        return this;
    }
}
