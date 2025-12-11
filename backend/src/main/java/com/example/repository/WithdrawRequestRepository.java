package com.example.repository;

import com.example.entity.WithdrawRequest;
import com.example.entity.enums.WithdrawStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select wr from WithdrawRequest wr where wr.withdraw_request_id = :id")
    Optional<WithdrawRequest> findByIdForUpdate(@Param("id") Long id);

    Page<WithdrawRequest> findByStatus(WithdrawStatus status, Pageable pageable);

    @Query("""
        select coalesce(sum(w.amount), 0)
        from WithdrawRequest w
        where w.status = :status
    """)
    long sumAmountByStatus(@Param("status") WithdrawStatus status);

    long countByStatus(WithdrawStatus status);


}
