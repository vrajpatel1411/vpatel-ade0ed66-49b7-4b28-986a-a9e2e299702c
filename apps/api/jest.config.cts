module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
   collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',       
    '!src/**/*.module.ts',     
    '!src/**/*.controller.ts', 
    '!src/**/*.entity.ts',      
    '!src/**/*.decorator.ts',  
    '!src/**/jwt.strategy.ts',  
    '!src/main.ts',            
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
};
