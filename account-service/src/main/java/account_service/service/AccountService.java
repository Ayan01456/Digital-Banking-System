package account_service.service;

import account_service.entity.Account;
import account_service.entity.Transaction;
import account_service.repository.AccountRepository;
import account_service.repository.TransactionRepository;
import account_service.entity.TransactionStatus;
import account_service.client.AuthClient; // Import the client
import account_service.dto.UserDTO; // Import the DTO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
// import java.math.BigDecimal;
import java.util.Random;
import java.util.List;
//import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import account_service.dto.TransferRequest;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AuthClient authClient; // 1. Inject the Feign Client

    @Autowired
    private TransactionRepository transactionRepository;

    // 2. Remove 'existingBalance' from parameters. We fetch it now!
    public Account createAccount(Long userId) {

        // 3. Call Auth Service to get the REAL data
        UserDTO user = authClient.getUserDetails(userId);

        Account account = new Account();
        account.setUserId(user.getId());

        // 4. Use the balance we just fetched from the Auth Service
        account.setBalance(user.getBalance());

        account.setAccountNumber(generateAccountNumber());
        return accountRepository.save(account);
    }

    private String generateAccountNumber() {
        Random random = new Random();
        long number = 1000000000L + (long) (random.nextDouble() * 9000000000L);
        return "BANK" + number;
    }

    public Account getAccountByUserId(Long userId) {
        return accountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Account not found for user: " + userId));
    }



    @Transactional
    public String processTransfer(String senderUsername, TransferRequest request) {
        // 1. Get the Sender's ID securely from the Auth Service
        UserDTO senderInfo = authClient.getUserByName(senderUsername);
        
        // 2. Fetch Sender Account using the ID we just got
        Account sender = accountRepository.findByUserId(senderInfo.getId())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        // 3. Fetch Receiver Account by the Number provided in the JSON
        Account receiver = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        // 4. Check if the sender has enough money
        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        // 5. Perform the transfer
        sender.setBalance(sender.getBalance().subtract(request.getAmount()));
        receiver.setBalance(receiver.getBalance().add(request.getAmount()));

        // 6. Save both updates to the database
        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setSenderAccountNumber(sender.getAccountNumber());
        transaction.setReceiverAccountNumber(receiver.getAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setStatus(TransactionStatus.SUCCESS); // Use your Enum here
        transaction.setTimestamp(java.time.LocalDateTime.now());

        transactionRepository.save(transaction);
        return "Transfer successful! Sent " + request.getAmount() + " to " + request.getToAccountNumber();
    }

    public List<Transaction> getRecentTransactions(String token) {
    // 1. Get the Email/Subject from the token
    // (Strip "Bearer " if your auth-service validation endpoint doesn't handle it)
    String pureToken = token.startsWith("Bearer ") ? token.substring(7) : token;
    String email = authClient.getSubjectFromToken(pureToken); 
    
    // 2. Get the full User details using the email
    UserDTO user = authClient.getUserByName(email);
    
    // 3. Find the account using the ID from the UserDTO
    Account account = accountRepository.findByUserId(user.getId())
        .orElseThrow(() -> new RuntimeException("Account not found for User: " + email));
        
    // 4. Return the history
    return transactionRepository.findTop10BySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
        account.getAccountNumber(), 
        account.getAccountNumber()
    );
}
}