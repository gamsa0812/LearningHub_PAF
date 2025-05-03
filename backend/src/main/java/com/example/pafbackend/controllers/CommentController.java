package com.example.pafbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.pafbackend.models.Comment;
import com.example.pafbackend.models.User;
import com.example.pafbackend.repositories.CommentRepository;
import com.example.pafbackend.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // POST: Create a new Comment
    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        return commentRepository.save(comment);
    }

    // GET: Retrieve all Comments with User details populated
    @GetMapping
    public List<Comment> getAllComments() {
        List<Comment> comments = commentRepository.findAll();

        return comments;
    }

    // GET: Retrieve a Comment by ID with User details populated
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String id) {
        Optional<Comment> comment = commentRepository.findById(id);
        return comment.map(c -> {
            return ResponseEntity.ok(c);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PUT: Update a Comment by ID
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable String id, @RequestBody Comment commentDetails) {
        return commentRepository.findById(id).map(comment -> {
            comment.setCommentText(commentDetails.getCommentText());
            // Presuming 'text' is a field within your Comment entity.
            // Add other fields as necessary.
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Delete a Comment by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        return commentRepository.findById(id).map(comment -> {
            commentRepository.delete(comment);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

      @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable String postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments;
    }

}
