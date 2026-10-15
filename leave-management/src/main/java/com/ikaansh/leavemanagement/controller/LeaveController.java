package com.ikaansh.leavemanagement.controller;

import com.ikaansh.leavemanagement.entity.*;
import com.ikaansh.leavemanagement.service.LeaveService;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequest> createLeave(@RequestBody LeaveRequest request, Principal principal) {
        return ResponseEntity.ok(leaveService.createLeaveRequest(request, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<LeaveRequest>> getAllLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(leaveService.getAllLeaveRequests(pageable));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.updateStatus(id, LeaveStatus.APPROVED));
    }
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<java.util.List<LeaveRequest>> myLeaves(Principal principal) {
        return ResponseEntity.ok(leaveService.getMyLeaves(principal.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.updateStatus(id, LeaveStatus.REJECTED));
    }
    
}