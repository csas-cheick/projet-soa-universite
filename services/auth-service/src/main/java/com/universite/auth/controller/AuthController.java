// Source code is decompiled from a .class file using FernFlower decompiler (from Intellij IDEA).
package com.universite.auth.controller;

import com.universite.auth.model.User;
import com.universite.auth.repository.UserRepository;
import com.universite.auth.util.JwtUtil;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/auth"})
public class AuthController {
   @Autowired
   private UserRepository userRepository;
   @Autowired
   private PasswordEncoder passwordEncoder;
   @Autowired
   private JwtUtil jwtUtil;

   public AuthController() {
   }

   @PostMapping({"/register"})
   public String register(@RequestBody User user) {
      if (this.userRepository.findByEmail(user.getEmail()).isPresent()) {
         throw new RuntimeException("Cet email est déjà utilisé !");
      } else {
         user.setPassword(this.passwordEncoder.encode(user.getPassword()));
         this.userRepository.save(user);
         return "Utilisateur enregistré avec succès !";
      }
   }

   @PostMapping({"/login"})
   public Map<String, String> login(@RequestBody Map<String, String> credentials) {
      String email = (String)credentials.get("email");
      String password = (String)credentials.get("password");
      User user = (User)this.userRepository.findByEmail(email).orElseThrow(() -> {
         return new RuntimeException("Utilisateur non trouvé");
      });
      if (this.passwordEncoder.matches(password, user.getPassword())) {
         String token = this.jwtUtil.generateToken(user.getEmail(), user.getRole());
         return Map.of("token", token, "role", user.getRole());
      } else {
         throw new RuntimeException("Mot de passe incorrect");
      }
   }
}
