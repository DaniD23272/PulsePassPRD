package com.pulsepass.mapper;

import com.pulsepass.dto.response.EventResponse;

import com.pulsepass.entity.Event;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface EventMapper {

    EventResponse toResponse(Event event);

}
