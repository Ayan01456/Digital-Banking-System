package account_service.repository;

import account_service.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    // Find the account using the User ID passed from the Auth Service
    Optional<Account> findByUserId(Long userId);
    
    // Find the receiver by their account number during a transfer
    Optional<Account> findByAccountNumber(String accountNumber);

    
}