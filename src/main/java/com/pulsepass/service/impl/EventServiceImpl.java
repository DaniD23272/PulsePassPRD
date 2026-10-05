package com.pulsepass.service.impl;

import com.pulsepass.entity.Event;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.service.EventService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    @Override
    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: " + id));
    }

    @Override
    public Event findByEventCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with code: " + eventCode));
    }

    @Override
    public List<Event> findByStatus(EventStatus status) {
        return eventRepository.findByStatusOrderByEventDateAsc(status);
    }

    @Override
    public List<Event> findByVenueCode(String code) {
        return eventRepository.findByVenueCode(code);
    }

    @Override
    public Event create(Event event) {

        if (eventRepository.findByEventCode(event.getEventCode()).isPresent()) {
            throw new BusinessRuleException(
                    "An event with code '" +
                            event.getEventCode() +
                            "' already exists.");
        }

        return eventRepository.save(event);
    }

    @Override
    public Event update(Long id, Event event) {

        Event existingEvent = findById(id);

        eventRepository.findByEventCode(event.getEventCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "An event with code '" +
                                    event.getEventCode() +
                                    "' already exists.");
                });

        existingEvent.setEventCode(event.getEventCode());
        existingEvent.setName(event.getName());
        existingEvent.setDescription(event.getDescription());
        existingEvent.setCategory(event.getCategory());
        existingEvent.setStatus(event.getStatus());
        existingEvent.setEventDate(event.getEventDate());
        existingEvent.setMinimumAge(event.getMinimumAge());
        existingEvent.setStreamingUrl(event.getStreamingUrl());
        existingEvent.setVenue(event.getVenue());
        existingEvent.setArtists(event.getArtists());

        return eventRepository.save(existingEvent);
    }

    @Override
    public void delete(Long id) {
        Event event = findById(id);
        eventRepository.delete(event);
    }
}