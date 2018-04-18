class SpaceService {
  constructor(ProjectService) {
    this.ProjectService = ProjectService;

  }

  createSpace(id, name, isPublic = true, isShowInNotebook = true) {
    return {
      id: id,
      name: name,
      isPublic: isPublic,
      isShowInNotebook: isShowInNotebook
    }
  }

  addSpace(id, name, isPublic = true, isShowInNotebook = true) {
    this.ProjectService.addSpace(
      this.createSpace(id, name, isPublic, isShowInNotebook));
  }

  removeSpace(id) {
    this.ProjectService.removeSpace(id);
  }
}

SpaceService.$inject = [
  'ProjectService'
];

export default SpaceService;
