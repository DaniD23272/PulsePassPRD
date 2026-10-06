package com.pulsepass.mapper;

import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(source = "event.eventCode", target = "eventCode")
    @Mapping(source = "user.username", target = "username")
    TicketResponse toResponse(Ticket ticket);
}