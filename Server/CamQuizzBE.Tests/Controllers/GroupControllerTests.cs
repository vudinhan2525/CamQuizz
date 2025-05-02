using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.Services;
using CamQuizzBE.Presentation.Controllers;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace CamQuizzBE.Tests.Controllers
{
    public class GroupControllerTests
    {
        private readonly Mock<IGroupService> _mockGroupService;
        private readonly GroupController _controller;

        public GroupControllerTests()
        {
            _mockGroupService = new Mock<IGroupService>();
            _controller = new GroupController(_mockGroupService.Object);
        }

        [Fact]
        public async Task GetMyGroups_ReturnsOkResult_WithGroups()
        {
            // Arrange
            var userId = 1;
            var expectedGroups = new List<GroupDto>
            {
                new() { 
                    Id = 1, 
                    Name = "Group 1", 
                    Description = "Description 1",
                    OwnerId = userId,
                    MemberIds = new List<int> { userId }
                },
                new() { 
                    Id = 2, 
                    Name = "Group 2", 
                    Description = "Description 2",
                    OwnerId = userId,
                    MemberIds = new List<int> { userId }
                }
            };
            _mockGroupService.Setup(s => s.GetMyGroupsAsync(userId))
                .ReturnsAsync(expectedGroups);

            // Act
            var result = await _controller.GetMyGroups(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedGroups = Assert.IsType<List<GroupDto>>(okResult.Value);
            Assert.Equal(expectedGroups.Count, returnedGroups.Count);
        }

        [Fact]
        public async Task GetGroupById_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var expectedGroup = new GroupDto
            { 
                Id = groupId, 
                Name = "Test Group",
                Description = "Test Description",
                OwnerId = 1,
                MemberIds = new List<int> { 1 }
            };
            _mockGroupService.Setup(s => s.GetGroupByIdAsync(groupId))
                .ReturnsAsync(expectedGroup);

            // Act
            var result = await _controller.GetGroupById(groupId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedGroup = Assert.IsType<GroupDto>(okResult.Value);
            Assert.Equal(groupId, returnedGroup.Id);
            Assert.Equal(expectedGroup.Description, returnedGroup.Description);
            Assert.Equal(expectedGroup.MemberIds, returnedGroup.MemberIds);
        }

        [Fact]
        public async Task GetGroupById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var groupId = 999;
            _mockGroupService.Setup(s => s.GetGroupByIdAsync(groupId))
                .ReturnsAsync((GroupDto)null);

            // Act
            var result = await _controller.GetGroupById(groupId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task CreateGroup_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var createDto = new CreateGroupDto { 
                Name = "New Group", 
                Description = "New Group Description",
                OwnerId = 1 
            };
            var createdGroup = new GroupDto { 
                Id = 1, 
                Name = "New Group", 
                Description = "New Group Description",
                OwnerId = 1,
                MemberIds = new List<int> { 1 }
            };
            
            _mockGroupService.Setup(s => s.CreateGroupAsync(createDto))
                .ReturnsAsync(createdGroup);

            // Act
            var result = await _controller.CreateGroup(createDto);

            // Assert
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(GroupController.GetGroupById), createdAtResult.ActionName);
            Assert.Equal(createdGroup.Id, (int)createdAtResult.RouteValues["id"]);
            var returnedGroup = Assert.IsType<GroupDto>(createdAtResult.Value);
            Assert.Equal(createDto.Description, returnedGroup.Description);
            Assert.Contains(createDto.OwnerId, returnedGroup.MemberIds);
        }

        [Fact]
        public async Task CreateGroup_WithNullData_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.CreateGroup(null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid group data.", badRequestResult.Value);
        }

        [Fact]
        public async Task DeleteGroup_WithOnHoldStatus_ReturnsNoContent()
        {
            // Arrange
            var groupId = 1;
            _mockGroupService.Setup(s => s.DeleteGroupAsync(groupId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteGroup(groupId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteGroup_WithNonOnHoldStatus_ReturnsBadRequest()
        {
            // Arrange
            var groupId = 1;
            _mockGroupService.Setup(s => s.DeleteGroupAsync(groupId))
                .ThrowsAsync(new ValidatorException("Can only delete groups that are in OnHold status"));

            // Act
            var result = await _controller.DeleteGroup(groupId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Can only delete groups that are in OnHold status", badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateStatus_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var groupId = 1;
            var updateDto = new UpdateGroupStatusDto { Status = GroupStatus.OnHold };
            _mockGroupService.Setup(s => s.UpdateGroupStatusAsync(groupId, updateDto))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateStatus(groupId, updateDto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task UpdateStatus_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var groupId = 999;
            var updateDto = new UpdateGroupStatusDto { Status = GroupStatus.OnHold };
            _mockGroupService.Setup(s => s.UpdateGroupStatusAsync(groupId, updateDto))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.UpdateStatus(groupId, updateDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task GetPendingMembers_ReturnsOkResult_WithMembers()
        {
            // Arrange
            var groupId = 1;
            var expectedMembers = new List<MemberDto>
            {
                new() { 
                    GroupId = groupId, 
                    UserId = 1, 
                    Status = MemberStatus.Pending
                },
                new() {
                    GroupId = groupId,
                    UserId = 2,
                    Status = MemberStatus.Pending
                }
            };
            _mockGroupService.Setup(s => s.GetPendingMembersAsync(groupId))
                .ReturnsAsync(expectedMembers);

            // Act
            var result = await _controller.GetPendingMembers(groupId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedMembers = Assert.IsType<List<MemberDto>>(okResult.Value);
            Assert.Equal(expectedMembers.Count, returnedMembers.Count);
            Assert.All(returnedMembers, member => Assert.Equal(MemberStatus.Pending, member.Status));
        }
    }
}
