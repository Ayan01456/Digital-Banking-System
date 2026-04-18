package account_service.controller;

import account_service.client.AuthClient;
import account_service.dto.UserDTO;
import account_service.entity.Account;
import account_service.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import account_service.dto.TransferRequest;
import java.util.List;
import account_service.entity.Transaction;


@RestController
@RequestMapping("/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    // This is what the "Get Account" button will call
    @PostMapping("/create/{userId}")
    public ResponseEntity<Account> createAccount(@PathVariable Long userId) {
        // Notice we only send the ID. The Service handles the rest!
        return ResponseEntity.ok(accountService.createAccount(userId));
    }

    @Autowired
    private AuthClient authClient;

    @PostMapping("/create")
    public ResponseEntity<Account> createAccount(Authentication authentication) {
        // 1. Get the username from the Security Context (extracted from JWT)
        String username = authentication.getName();

        // 2. Talk to Auth Service: "Hey, give me the UserDTO for this name"
        UserDTO user = authClient.getUserByName(username);

        // 3. Now we have the ID! Use it to call your existing service logic
        // This calls your createAccount(Long userId) method in AccountService.java
        return ResponseEntity.ok(accountService.createAccount(user.getId()));
    }

    @GetMapping("/user/{userId}") 
    public ResponseEntity<Account> getAccount(@PathVariable Long userId) {
        return ResponseEntity.ok(accountService.getAccountByUserId(userId));
    }

    @GetMapping("/my-account") 
public ResponseEntity<Account> getAccount(Authentication authentication) {
    // 1. Get username from token
    String username = authentication.getName(); 
    
    // 2. Ask Auth Service for the ID (since it's now ID 8)
    UserDTO user = authClient.getUserByName(username); 
    
    // 3. Get the account using that ID
    return ResponseEntity.ok(accountService.getAccountByUserId(user.getId()));
}

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(
            Authentication authentication, 
            @RequestBody TransferRequest request) {
        
        // 1. authentication.getName() = The username from the JWT
        // 2. request = The JSON data (toAccount, amount, description)
        
        String result = accountService.processTransfer(authentication.getName(), request);
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
public ResponseEntity<List<Transaction>> getMyHistory(@RequestHeader("Authorization") String token) {
    // We send the full "Bearer <token>" string to the service
    List<Transaction> history = accountService.getRecentTransactions(token);
    return ResponseEntity.ok(history);
}

}