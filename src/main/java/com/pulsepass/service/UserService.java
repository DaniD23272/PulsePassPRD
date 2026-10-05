package com.pulsepass.service;

import com.pulsepass.entity.User;

import java.util.List;

public interface UserService {

    List<User> findAll();

    User findById(Long id);

    User findByEmail(String email);

    User create(User user);

    User update(Long id, User user);

    void delete(Long id);
}