using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CamQuizzBE.Tests.Controllers
{
    public class MemberControllerTests
    {
        private readonly Mock<IMemberService> _mockMemberService;
        private readonly MemberController _controller;

        private static string GetDynamicValue(object obj, string propertyName)
        {
            var dict = obj as IDictionary<string, object>;
            return dict != null && dict.TryGetValue(propertyName, out var value) ? value?.ToString() : null;
        }

        public MemberControllerTests()
        {
            _mockMemberService = new Mock<IMemberService>();
            _controller = new MemberController(_mockMemberService.Object);
        }

        [Fact]
        public async Task GetMembersByGroupId_ReturnsOkResult_WithMembers()
        {
            // Arrange
            var groupId = 1;
            var expectedMembers = new List<MemberDto>
            {
                new MemberDto { GroupId = groupId, UserId = 1, Status = MemberStatus.Approved },
                new MemberDto { GroupId = groupId, UserId = 2, Status = MemberStatus.Approved }
            };

            _mockMemberService.Setup(s => s.GetMembersByGroupIdAsync(groupId))
                .ReturnsAsync(expectedMembers);

            // Act
            var result = await _controller.GetMembersByGroupId(groupId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedMembers = Assert.IsType<List<MemberDto>>(okResult.Value);
            Assert.Equal(expectedMembers.Count, returnedMembers.Count);
        }

        [Fact]
        public async Task GetPendingMembers_ReturnsOkResult_WithPendingMembers()
        {
            // Arrange
            var groupId = 1;
            var expectedMembers = new List<Member>
            {
                new Member { GroupId = groupId, UserId = 1, Status = MemberStatus.Pending },
                new Member { GroupId = groupId, UserId = 2, Status = MemberStatus.Pending }
            };

            _mockMemberService.Setup(s => s.GetPendingMembersAsync(groupId))
                .ReturnsAsync(expectedMembers);

            // Act
            var result = await _controller.GetPendingMembers(groupId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedMembers = Assert.IsType<List<Member>>(okResult.Value);
            Assert.Equal(expectedMembers.Count, returnedMembers.Count);
            Assert.All(returnedMembers, member => Assert.Equal(MemberStatus.Pending, member.Status));
        }

        [Fact]
        public async Task RequestToJoinGroup_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var userId = 1;

            _mockMemberService.Setup(s => s.RequestToJoinGroupAsync(groupId, userId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.RequestToJoinGroup(groupId, userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            var message = response.GetType().GetProperty("message")?.GetValue(response)?.ToString();
            Assert.Equal("Join request sent successfully", message);
        }

        [Fact]
        public async Task ApproveMember_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var userId = 2;
            var ownerId = 1;

            // Act
            var result = await _controller.ApproveMember(groupId, userId, ownerId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            var message = response.GetType().GetProperty("message")?.GetValue(response)?.ToString();
            Assert.Equal("Member approved successfully", message);
        }

        [Fact]
        public async Task RejectMember_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var userId = 2;
            var ownerId = 1;

            // Act
            var result = await _controller.RejectMember(groupId, userId, ownerId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            var message = response.GetType().GetProperty("message")?.GetValue(response)?.ToString();
            Assert.Equal("Member rejected successfully", message);
        }

        [Fact]
        public async Task LeaveGroup_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var userId = 2;

            // Act
            var result = await _controller.LeaveGroup(groupId, userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            var message = response.GetType().GetProperty("message")?.GetValue(response)?.ToString();
            Assert.Equal("Left group successfully", message);
        }

        [Fact]
        public async Task RemoveMember_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var userId = 2;
            var ownerId = 1;

            // Act
            var result = await _controller.RemoveMember(groupId, userId, ownerId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            var message = response.GetType().GetProperty("message")?.GetValue(response)?.ToString();
            Assert.Equal("Member removed successfully", message);
        }

        [Fact]
        public async Task RequestToJoinGroup_WhenUserAlreadyMember_ReturnsBadRequest()
        {
            // Arrange
            var groupId = 1;
            var userId = 1;
            _mockMemberService.Setup(s => s.RequestToJoinGroupAsync(groupId, userId))
                .ThrowsAsync(new InvalidOperationException("User is already a member"));

            // Act
            var result = await _controller.RequestToJoinGroup(groupId, userId);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task ApproveMember_WhenNotOwner_ReturnsUnauthorized()
        {
            // Arrange
            var groupId = 1;
            var userId = 2;
            var invalidOwnerId = 3;
            _mockMemberService.Setup(s => s.ApproveMemberAsync(groupId, userId, invalidOwnerId))
                .ThrowsAsync(new UnauthorizedAccessException());

            // Act
            var result = await _controller.ApproveMember(groupId, userId, invalidOwnerId);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task RemoveMember_WhenGroupNotFound_ReturnsNotFound()
        {
            // Arrange
            var groupId = 999;
            var userId = 1;
            var ownerId = 1;
            _mockMemberService.Setup(s => s.RemoveMemberAsync(groupId, userId, ownerId))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.RemoveMember(groupId, userId, ownerId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}