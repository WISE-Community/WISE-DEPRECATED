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
    if (!this.isSpaceExists(id)) {
      this.ProjectService.addSpace(
          this.createSpace(id, name, isPublic, isShowInNotebook));
    }
  }

  removeSpace(id) {
    this.ProjectService.removeSpace(id);
  }

  isSpaceExists(id) {
    const spaces = this.ProjectService.getSpaces();
    for (let space of spaces) {
      if (space.id === id) {
        return true;
      }
    }
    return false;
  }
}

SpaceService.$inject = [
  'ProjectService'
];

export default SpaceService;
