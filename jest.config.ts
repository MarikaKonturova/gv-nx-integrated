import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: [...(await getJestProjectsAsync()), '<rootDir>/apps/gv/jest.config.ts'],
});
