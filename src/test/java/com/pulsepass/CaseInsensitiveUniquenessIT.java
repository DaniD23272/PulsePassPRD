package com.pulsepass;

import com.pulsepass.entity.Artist;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.User;
import com.pulsepass.entity.Venue;
import com.pulsepass.enums.EventCategory;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * El nombre de usuario y el nombre artístico deben tratarse sin distinguir
 * mayúsculas, igual que ya hace el correo (ver V4__enforce_domain_integrity).
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class CaseInsensitiveUniquenessIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void database_rejectsAUsernameThatDiffersOnlyInCase() {
        User first = new User();
        first.setUsername("CaseUser");
        first.setEmail("case-user@x.com");
        first.setActive(true);
        userRepository.saveAndFlush(first);

        User second = new User();
        second.setUsername("caseuser");
        second.setEmail("otro-correo@x.com");
        second.setActive(true);

        assertThrows(DataIntegrityViolationException.class,
                () -> userRepository.saveAndFlush(second));
    }

    @Test
    void userRepository_findsByUsernameIgnoringCase() {
        User user = new User();
        user.setUsername("CaseLookup");
        user.setEmail("case-lookup@x.com");
        user.setActive(true);
        userRepository.saveAndFlush(user);

        assertTrue(userRepository.findByUsernameIgnoreCase("caselookup").isPresent());
        assertTrue(userRepository.existsByUsernameIgnoreCase("CASELOOKUP"));
    }

    @Test
    void database_rejectsAStageNameThatDiffersOnlyInCase() {
        Artist first = new Artist();
        first.setStageName("Case Band");
        first.setCountry("Colombia");
        first.setGenre("Music");
        first.setActive(true);
        artistRepository.saveAndFlush(first);

        Artist second = new Artist();
        second.setStageName("case band");
        second.setCountry("Colombia");
        second.setGenre("Music");
        second.setActive(true);

        assertThrows(DataIntegrityViolationException.class,
                () -> artistRepository.saveAndFlush(second));
    }

    @Test
    void eventsByArtist_ignoreCaseOfTheStageName() {
        Artist artist = new Artist();
        artist.setStageName("Case Search Artist");
        artist.setCountry("Colombia");
        artist.setGenre("Music");
        artist.setActive(true);
        artist = artistRepository.saveAndFlush(artist);

        Venue venue = new Venue();
        venue.setCode("VEN-CASE-01");
        venue.setName("Case Venue");
        venue.setCity("Santa Marta");
        venue.setAddress("Test Address");
        venue.setCapacity(100);
        venue.setActive(true);
        venue = venueRepository.saveAndFlush(venue);

        Event event = new Event();
        event.setEventCode("EVENT-CASE-01");
        event.setName("Case Event");
        event.setCategory(EventCategory.MUSIC);
        event.setStatus(EventStatus.PUBLISHED);
        event.setEventDate(LocalDateTime.now().plusDays(30));
        event.setMinimumAge(0);
        event.setVenue(venue);
        event.getArtists().add(artist);
        eventRepository.saveAndFlush(event);

        assertFalse(eventRepository.findByArtistStageName("case search artist").isEmpty());
        assertFalse(eventRepository.findByArtistStageName("CASE SEARCH ARTIST").isEmpty());
        assertFalse(eventRepository
                .findByArtistStageNameAndStatus("case search artist", EventStatus.PUBLISHED)
                .isEmpty());
        assertFalse(eventRepository
                .findByCityAndArtistStageName("Santa Marta", "case search artist")
                .isEmpty());
    }
}
