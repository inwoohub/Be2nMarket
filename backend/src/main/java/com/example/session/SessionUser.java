package com.example.session;

import java.io.Serializable;

public record SessionUser(Long id, String nickname, String role) implements Serializable {

}
