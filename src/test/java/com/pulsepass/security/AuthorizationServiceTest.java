package com.pulsepass.security;

import com.pulsepass.entity.Artist;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.Ticket;
import com.pulsepass.entity.User;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    TicketRepository ticketRepository;

    @Mock
    EventRepository eventRepository;

    @InjectMocks
    AuthorizationService service;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId, String... roles) {
        List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(
                List.of(roles).stream().map(role -> "ROLE_" + role).toArray(String[]::new));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities));
    }

    private void authenticateAnonymously() {
        SecurityContextHolder.getContext().setAuthentication(
                new AnonymousAuthenticationToken(
                        "key", "anonymous",
                        List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));
    }

    // ---------- currentUserId ----------

    @Test
    void currentUserId_isNullWithoutAuthentication() {
        assertThat(service.currentUserId()).isNull();
    }

    @Test
    void currentUserId_isNullForAnonymousUser() {
        authenticateAnonymously();
        assertThat(service.currentUserId()).isNull();
    }

    @Test
    void currentUserId_isNullWhenSubjectIsNotNumeric() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("not-a-number", null, List.of()));
        assertThat(service.currentUserId()).isNull();
    }

    @Test
    void currentUserId_returnsIdWhenAuthenticated() {
        authenticateAs(7L, "USER");
        assertThat(service.currentUserId()).isEqualTo(7L);
    }

    // ---------- isCurrentUserEmail ----------

    @Test
    void isCurrentUserEmail_trueWhenEmailBelongsToCurrentUser() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(7L);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        assertThat(service.isCurrentUserEmail("a@x.com")).isTrue();
    }

    @Test
    void isCurrentUserEmail_falseWhenEmailBelongsToSomeoneElse() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(99L);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        assertThat(service.isCurrentUserEmail("a@x.com")).isFalse();
    }

    @Test
    void isCurrentUserEmail_falseWithoutAuthentication() {
        assertThat(service.isCurrentUserEmail("a@x.com")).isFalse();
    }

    @Test
    void isCurrentUserEmail_falseForBlankEmail() {
        authenticateAs(7L, "USER");
        assertThat(service.isCurrentUserEmail(" ")).isFalse();
        assertThat(service.isCurrentUserEmail(null)).isFalse();
    }

    @Test
    void isCurrentUserEmail_falseWhenEmailDoesNotExist() {
        authenticateAs(7L, "USER");
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.empty());

        assertThat(service.isCurrentUserEmail("a@x.com")).isFalse();
    }

    // ---------- canAccessUserEmail ----------

    @Test
    void canAccessUserEmail_trueForAdminRegardlessOfOwnership() {
        authenticateAs(1L, "ADMIN");

        assertThat(service.canAccessUserEmail("someone-else@x.com")).isTrue();
    }

    @Test
    void canAccessUserEmail_trueForOwner() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(7L);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        assertThat(service.canAccessUserEmail("a@x.com")).isTrue();
    }

    @Test
    void canAccessUserEmail_falseForThirdParty() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(99L);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        assertThat(service.canAccessUserEmail("a@x.com")).isFalse();
    }

    // ---------- canAccessUserName ----------

    @Test
    void canAccessUserName_trueForAdmin() {
        authenticateAs(1L, "ADMIN");
        assertThat(service.canAccessUserName("anyone")).isTrue();
    }

    @Test
    void canAccessUserName_trueForOwner() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(7L);
        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user));

        assertThat(service.canAccessUserName("andrea")).isTrue();
    }

    @Test
    void canAccessUserName_falseForThirdParty() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(99L);
        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user));

        assertThat(service.canAccessUserName("andrea")).isFalse();
    }

    @Test
    void canAccessUserName_falseForBlankUsername() {
        authenticateAs(7L, "USER");
        assertThat(service.canAccessUserName(" ")).isFalse();
    }

    // ---------- canAccessTicket ----------

    @Test
    void canAccessTicket_trueForStaff() {
        authenticateAs(1L, "STAFF");
        assertThat(service.canAccessTicket("TCK-1")).isTrue();
    }

    @Test
    void canAccessTicket_trueForAdmin() {
        authenticateAs(1L, "ADMIN");
        assertThat(service.canAccessTicket("TCK-1")).isTrue();
    }

    @Test
    void canAccessTicket_trueForOwner() {
        authenticateAs(7L, "USER");
        User owner = new User();
        owner.setId(7L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThat(service.canAccessTicket("TCK-1")).isTrue();
    }

    @Test
    void canAccessTicket_falseForThirdPartyUser() {
        authenticateAs(7L, "USER");
        User owner = new User();
        owner.setId(99L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThat(service.canAccessTicket("TCK-1")).isFalse();
    }

    @Test
    void canAccessTicket_falseWhenTicketDoesNotExist() {
        authenticateAs(7L, "USER");
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.empty());

        assertThat(service.canAccessTicket("TCK-1")).isFalse();
    }

    // ---------- canAccessTicketsByEmail ----------

    @Test
    void canAccessTicketsByEmail_trueForAdmin() {
        authenticateAs(1L, "ADMIN");
        assertThat(service.canAccessTicketsByEmail("a@x.com")).isTrue();
    }

    @Test
    void canAccessTicketsByEmail_falseForStaff() {
        authenticateAs(1L, "STAFF");
        assertThat(service.canAccessTicketsByEmail("a@x.com")).isFalse();
    }

    @Test
    void canAccessTicketsByEmail_trueForOwner() {
        authenticateAs(7L, "USER");
        User user = new User();
        user.setId(7L);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));

        assertThat(service.canAccessTicketsByEmail("a@x.com")).isTrue();
    }

    // ---------- canCancelTicket ----------

    @Test
    void canCancelTicket_trueForAdminRegardlessOfOwnership() {
        authenticateAs(1L, "ADMIN");
        assertThat(service.canCancelTicket("TCK-1")).isTrue();
    }

    @Test
    void canCancelTicket_falseForStaff() {
        authenticateAs(1L, "STAFF");
        assertThat(service.canCancelTicket("TCK-1")).isFalse();
    }

    @Test
    void canCancelTicket_trueForOwningUser() {
        authenticateAs(7L, "USER");
        User owner = new User();
        owner.setId(7L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThat(service.canCancelTicket("TCK-1")).isTrue();
    }

    @Test
    void canCancelTicket_falseForNonOwningUser() {
        authenticateAs(7L, "USER");
        User owner = new User();
        owner.setId(99L);
        Ticket ticket = new Ticket();
        ticket.setUser(owner);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThat(service.canCancelTicket("TCK-1")).isFalse();
    }

    // ---------- isTicketOwnedByCurrentUser ----------

    @Test
    void isTicketOwnedByCurrentUser_falseWithoutAuthentication() {
        assertThat(service.isTicketOwnedByCurrentUser("TCK-1")).isFalse();
    }

    @Test
    void isTicketOwnedByCurrentUser_falseForBlankCode() {
        authenticateAs(7L, "USER");
        assertThat(service.isTicketOwnedByCurrentUser(" ")).isFalse();
    }

    // ---------- isPublishedEvent ----------

    @Test
    void isPublishedEvent_trueWhenEventIsPublished() {
        Event event = new Event();
        event.setStatus(EventStatus.PUBLISHED);
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.of(event));

        assertThat(service.isPublishedEvent("EV-1")).isTrue();
    }

    @Test
    void isPublishedEvent_falseWhenEventIsDraft() {
        Event event = new Event();
        event.setStatus(EventStatus.DRAFT);
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.of(event));

        assertThat(service.isPublishedEvent("EV-1")).isFalse();
    }

    @Test
    void isPublishedEvent_falseWhenEventDoesNotExist() {
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.empty());
        assertThat(service.isPublishedEvent("EV-1")).isFalse();
    }

    @Test
    void isPublishedEvent_falseForBlankCode() {
        assertThat(service.isPublishedEvent(" ")).isFalse();
        assertThat(service.isPublishedEvent(null)).isFalse();
    }

    // ---------- hasPublishedEventsForArtist ----------

    @Test
    void hasPublishedEventsForArtist_trueWhenAtLeastOneExists() {
        when(eventRepository.findByArtistStageNameAndStatus("Solar Beat", EventStatus.PUBLISHED))
                .thenReturn(List.of(new Event()));

        assertThat(service.hasPublishedEventsForArtist("Solar Beat")).isTrue();
    }

    @Test
    void hasPublishedEventsForArtist_falseWhenNoneExist() {
        when(eventRepository.findByArtistStageNameAndStatus("Solar Beat", EventStatus.PUBLISHED))
                .thenReturn(List.of());

        assertThat(service.hasPublishedEventsForArtist("Solar Beat")).isFalse();
    }

    @Test
    void hasPublishedEventsForArtist_falseForBlankStageName() {
        assertThat(service.hasPublishedEventsForArtist(" ")).isFalse();
    }

    // ---------- hasRole ----------

    @Test
    void hasRole_trueWhenAuthorityIsPresent() {
        authenticateAs(1L, "ADMIN");
        assertThat(service.hasRole("ADMIN")).isTrue();
    }

    @Test
    void hasRole_falseWhenAuthorityIsAbsent() {
        authenticateAs(1L, "USER");
        assertThat(service.hasRole("ADMIN")).isFalse();
    }

    @Test
    void hasRole_falseForAnonymousUser() {
        authenticateAnonymously();
        assertThat(service.hasRole("USER")).isFalse();
    }

    @Test
    void hasRole_falseWithoutAuthentication() {
        assertThat(service.hasRole("USER")).isFalse();
    }
}
