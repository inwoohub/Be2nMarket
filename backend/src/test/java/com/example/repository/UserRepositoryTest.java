// src/test/java/com/example/repository/UserRepositoryTest.java
package com.example.repository;

import com.example.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;

import org.assertj.core.api.Assertions;

@DataJpaTest
@ActiveProfiles("dev")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Rollback(false)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("카카오 ID(Long)로 User 저장/조회")
    void save_and_find_user_by_kakao_id() {
        // given
        Long kakaoId = 3227567890L;
        String nickname = "테스트용입니다";

        User user = User.builder()
                .user_id(kakaoId)
                .nickname(nickname)
                .build();

        // when
        userRepository.saveAndFlush(user);

        // then
        User found = userRepository.findById(kakaoId).orElseThrow();
        Assertions.assertThat(found.getUser_id()).isEqualTo(kakaoId);
        Assertions.assertThat(found.getNickname()).isEqualTo("테스트용입니다");
        Assertions.assertThat(found.getManner_score()).isNotNull();
    }
}
