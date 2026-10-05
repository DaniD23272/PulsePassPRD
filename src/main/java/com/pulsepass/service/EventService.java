package com.pulsepass.service;

import com.pulsepass.entity.Event;
import com.pulsepass.enums.EventStatus;

import java.util.List;

public interface EventService {

    List<Event> findAll();

    Event findById(Long id);

    Event findByEventCode(String eventCode);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByVenueCode(String code);

    Event create(Event event);

    Event update(Long id, Event event);

    void delete(Long id);
}