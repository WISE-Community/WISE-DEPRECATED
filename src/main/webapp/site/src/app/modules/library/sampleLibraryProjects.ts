import { LibraryProject } from './libraryProject';

const projects: LibraryProject[] = [];
const project1 = new LibraryProject();
project1.id = 1;
project1.name = 'Photosynthesis';
project1.metadata = {
  standardsAddressed: {
    ngss: {
      disciplines: [
        {
          id: 'LS',
          name: 'Life Sciences'
        }
      ],
      dci: [
        {
          id: 'LS1.B',
          name: 'Growth and Development of Organisms'
        }
      ],
      dciArrangements: [
        {
          id: 'MS-LS1',
          name: 'From Molecules to Organisms: Structures and Processes',
          children: [
            {
              id: 'MS-LS1-4',
              name:
                'Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively.'
            },
            {
              id: 'MS-LS1-5',
              name:
                'Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms.'
            }
          ]
        }
      ],
      ccc: [
        {
          id: 'ce',
          name: 'Cause and Effect'
        }
      ],
      practices: [
        {
          id: 'eae',
          name: 'Engaging in Argument from Evidence'
        }
      ]
    }
  }
};
projects.push(project1);

const project2 = new LibraryProject();
project2.id = 2;
project2.name = 'Global Climate Change';
project2.metadata = {
  standardsAddressed: {
    ngss: {
      disciplines: [
        {
          id: 'PS',
          name: 'Physical Sciences'
        }
      ],
      dci: [
        {
          id: 'LS1.B',
          name: 'Growth and Development of Organisms'
        }
      ],
      dciArrangements: [
        {
          id: 'MS-LS1',
          name: 'From Molecules to Organisms: Structures and Processes',
          children: [
            {
              id: 'MS-LS1-4',
              name:
                'Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively.'
            },
            {
              id: 'MS-LS1-6',
              name:
                'Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms.'
            }
          ]
        }
      ],
      ccc: [
        {
          id: 'ce',
          name: 'Cause and Effect'
        }
      ],
      practices: [
        {
          id: 'ceds',
          name: 'Constructing Explanations and Designing Solutions'
        }
      ]
    }
  }
};
projects.push(project2);

export default projects;
