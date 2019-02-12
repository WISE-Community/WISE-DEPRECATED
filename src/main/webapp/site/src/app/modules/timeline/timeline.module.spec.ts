import { TimelineModule } from './timeline.module';

describe('TimelineModule', () => {
  let timelineModule: TimelineModule;

  beforeEach(() => {
    timelineModule = new TimelineModule();
  });

  it('should create an instance', () => {
    expect(timelineModule).toBeTruthy();
  });
});
