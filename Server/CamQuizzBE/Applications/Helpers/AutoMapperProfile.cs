using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.Files;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Applications.DTOs.Groups;


namespace CamQuizzBE.Applications.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, UserDto>()
            .ForMember(
                d => d.Roles,
                o => o.MapFrom(
                    s => s.UserRoles.Select(x => x.Role.Name)
                )
            );
        CreateMap<RegisterDto, AppUser>()
            .ForMember(
                u => u.UserName,
                r => r.MapFrom(x => x.FirstName.ToLower() + x.LastName.ToLower())
            );
        CreateMap<Quizzes, QuizzesDto>().ReverseMap();
        CreateMap<Member, MemberDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}