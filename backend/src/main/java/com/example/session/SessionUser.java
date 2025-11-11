package com.example.session;

import java.io.Serializable;

public record SessionUser(Long userId, String nickname) implements Serializable {}
