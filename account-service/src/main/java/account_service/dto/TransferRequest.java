package account_service.dto;

import java.math.BigDecimal;
import java.util.List;
import account_service.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public class TransferRequest {
    private String toAccountNumber;
    private BigDecimal amount;
    private String description;

    // Standard Getters and Setters
    public String getToAccountNumber() { return toAccountNumber; }
    public void setToAccountNumber(String toAccountNumber) { this.toAccountNumber = toAccountNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // This finds the 10 most recent transactions where the user was either the sender or receiver
    List<Transaction> findTop10BySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
        String sender, String receiver
    );
}
}