package account_service.repository;

import account_service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Fetches history where the user was either the sender OR the receiver
  

    List<Transaction> findTop10BySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
        String sender, String receiver
    );
}

