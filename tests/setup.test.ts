import fs from 'fs';
import path from 'path';

describe('Project Setup', () => {
  it('should have a package.json file', () => {
    const filePath = path.join(__dirname, '../package.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should have a tsconfig.json file', () => {
    const filePath = path.join(__dirname, '../tsconfig.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should have a .env or .env.example file', () => {
    const envPath = path.join(__dirname, '../.env');
    const examplePath = path.join(__dirname, '../.env.example');
    expect(fs.existsSync(envPath) || fs.existsSync(examplePath)).toBe(true);
  });

  it('should have a .gitignore file', () => {
    const filePath = path.join(__dirname, '../.gitignore');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should have a .eslintrc.json file', () => {
    const filePath = path.join(__dirname, '../.eslintrc.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should have a .prettierrc file', () => {
    const filePath = path.join(__dirname, '../.prettierrc');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
