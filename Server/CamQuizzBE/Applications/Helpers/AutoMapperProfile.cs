using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Applications.DTOs.Answers;
using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Applications.DTOs.FlashCards;
using CamQuizzBE.Applications.DTOs.Packages;

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
        CreateMap<UpdateUserDto, AppUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<Quizzes, QuizzesDto>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions))
            .ReverseMap();
        CreateMap<Questions, QuestionsDto>()
            .ForMember(dest => dest.Answers, opt => opt.MapFrom(src => src.Answers))
            .ReverseMap();
        CreateMap<Answers, AnswerDto>().ReverseMap();
        CreateMap<StudySet, StudySetDto>().ReverseMap();
        CreateMap<FlashCard, FlashCardDto>().ReverseMap();
        CreateMap<Packages, PackageDto>().ReverseMap();
        CreateMap<UserPackages, UserPackagesDto>().ReverseMap();

        CreateMap<Member, MemberDto>();
    }
}