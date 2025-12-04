// src/main/java/com/example/repository/WalletLedgerRepository.java
package com.example.repository;

import com.example.entity.WalletLedger;
import com.example.entity.enums.LedgerEntryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WalletLedgerRepository extends JpaRepository<WalletLedger, Long> {

    @Query("""
        select coalesce(sum(w.amount), 0)
        from WalletLedger w
        where w.entry_type in :types
    """)
    long sumAmountByEntryTypes(@Param("types") List<LedgerEntryType> types);

    @Query("""
        select count(w)
        from WalletLedger w
        where w.entry_type in :types
    """)
    long countByEntryTypes(@Param("types") List<LedgerEntryType> types);


}
