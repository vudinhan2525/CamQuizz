// using System;
// using System.Collections.Generic;
// using System.Threading.Tasks;
// using CamQuizzBE.Applications.Services;
// using CamQuizzBE.Domain.Entities;
// using CamQuizzBE.Domain.Enums;
// using CamQuizzBE.Domain.Interfaces;
// using CamQuizzBE.Applications.DTOs.Groups;
// using Moq;
// using Xunit;

// namespace CamQuizzBE.Tests.Services
// {
//     public class MemberServiceTests
//     {
//         private readonly Mock<IMemberRepository> _mockMemberRepo;
//         private readonly Mock<IGroupRepository> _mockGroupRepo;
//         private readonly MemberService _service;

//         public MemberServiceTests()
//         {
//             _mockMemberRepo = new Mock<IMemberRepository>();
//             _mockGroupRepo = new Mock<IGroupRepository>();
//             _service = new MemberService(_mockMemberRepo.Object, _mockGroupRepo.Object);
//         }

//         [Fact]
//         public async Task GetMembersByGroupId_ReturnsMembers()
//         {
//             // Arrange
//             var groupId = 1;
//             var group = new GroupDto { Id = groupId, Status = GroupStatus.Active };
//             var expectedMembers = new List<Member>
//             {
//                 new() { GroupId = groupId, UserId = 1, Status = MemberStatus.Approved },
//                 new() { GroupId = groupId, UserId = 2, Status = MemberStatus.Approved }
//             };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);
//             _mockMemberRepo.Setup(r => r.GetMembersByGroupIdAsync(groupId))
//                 .ReturnsAsync(expectedMembers);

//             // Act
//             var result = await _service.GetMembersByGroupIdAsync(groupId);

//             // Assert
//             Assert.Equal(expectedMembers.Count, result.Count());
//         }

//         [Fact]
//         public async Task GetPendingMembers_ReturnsPendingMembers()
//         {
//             // Arrange
//             var groupId = 1;
//             var group = new GroupDto { Id = groupId, Status = GroupStatus.Active };
//             var expectedMembers = new List<Member>
//             {
//                 new() { GroupId = groupId, UserId = 1, Status = MemberStatus.Pending },
//                 new() { GroupId = groupId, UserId = 2, Status = MemberStatus.Pending }
//             };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);
//             _mockMemberRepo.Setup(r => r.GetPendingMembersAsync(groupId))
//                 .ReturnsAsync(expectedMembers);

//             // Act
//             var result = await _service.GetPendingMembersAsync(groupId);

//             // Assert
//             Assert.All(result, member => Assert.Equal(MemberStatus.Pending, member.Status));
//         }

//         [Fact]
//         public async Task RequestToJoinGroup_WhenGroupNotFound_ThrowsException()
//         {
//             // Arrange
//             var groupId = 1;
//             var userId = 1;
//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync((GroupDto)null);

//             // Act & Assert
//             await Assert.ThrowsAsync<KeyNotFoundException>(
//                 () => _service.RequestToJoinGroupAsync(groupId, userId)
//             );
//         }

//         [Fact]
//         public async Task RequestToJoinGroup_WhenAlreadyMember_ThrowsException()
//         {
//             // Arrange
//             var groupId = 1;
//             var userId = 1;
//             var group = new GroupDto { Id = groupId, Status = GroupStatus.Active };
//             var existingMember = new Member { GroupId = groupId, UserId = userId };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);
//             _mockMemberRepo.Setup(r => r.GetByIdAsync(groupId, userId))
//                 .ReturnsAsync(existingMember);

//             // Act & Assert
//             await Assert.ThrowsAsync<InvalidOperationException>(
//                 () => _service.RequestToJoinGroupAsync(groupId, userId)
//             );
//         }

//         [Fact]
//         public async Task ApproveMember_WhenNotOwner_ThrowsUnauthorized()
//         {
//             // Arrange
//             var groupId = 1;
//             var userId = 2;
//             var invalidOwnerId = 3;
//             var group = new GroupDto { Id = groupId, OwnerId = 1 };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);

//             // Act & Assert
//             await Assert.ThrowsAsync<UnauthorizedAccessException>(
//                 () => _service.ApproveMemberAsync(groupId, userId, invalidOwnerId)
//             );
//         }

//         [Fact]
//         public async Task ApproveMember_WhenNotPendingMember_ThrowsException()
//         {
//             // Arrange
//             var groupId = 1;
//             var userId = 2;
//             var ownerId = 1;
//             var group = new GroupDto { Id = groupId, OwnerId = ownerId };
//             var member = new Member { GroupId = groupId, UserId = userId, Status = MemberStatus.Approved };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);
//             _mockMemberRepo.Setup(r => r.GetByIdAsync(groupId, userId))
//                 .ReturnsAsync(member);

//             // Act & Assert
//             await Assert.ThrowsAsync<InvalidOperationException>(
//                 () => _service.ApproveMemberAsync(groupId, userId, ownerId)
//             );
//         }

//         [Fact]
//         public async Task LeaveGroup_WhenOwner_ThrowsException()
//         {
//             // Arrange
//             var groupId = 1;
//             var ownerId = 1;
//             var group = new GroupDto { Id = groupId, OwnerId = ownerId };

//             _mockGroupRepo.Setup(r => r.GetGroupByIdAsync(groupId))
//                 .ReturnsAsync(group);

//             // Act & Assert
//             await Assert.ThrowsAsync<InvalidOperationException>(
//                 () => _service.LeaveGroupAsync(groupId, ownerId)
//             );
//         }
//     }
// }