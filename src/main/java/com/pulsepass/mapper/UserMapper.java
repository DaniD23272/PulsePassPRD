package com.pulsepass.mapper;

import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}