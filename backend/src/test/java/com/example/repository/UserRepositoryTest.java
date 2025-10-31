
// DB저장 잘 되나 테스트용 코드입니다~ 하드코딩했어요

package com.example.repository;

import com.example.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Rollback(false) // false 는 진짜 저장이고, true면 Rollback해서 저장 안됨.
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager em; // ← flush/clear 위해 주입

    @Test
    @DisplayName("User 한 건 저장")
    void save_one_user() {

        // given
        User u = User.builder()
                .user_id(Long.valueOf(1234567890))
                .nickname("인우")
                .profile_image_url("https://solved.ac/profile/dlsdndls")
                .build(); // manner_score는 @Builder.Default로 36.5

        // when
        User saved = userRepository.saveAndFlush(u); // 즉시 flush
        em.clear();                                   // 1차 캐시 비우기

        // then:
        User found = userRepository.findById(saved.getUser_id()).orElseThrow();
        assertThat(found.getNickname()).isEqualTo("인우");
        assertThat(found.getManner_score()).isEqualByComparingTo(new BigDecimal("36.5"));
    }
}
