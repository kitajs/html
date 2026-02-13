import {
  HomeHero as BasicHomeHero,
  HomeLayout as BasicHomeLayout,
  PackageManagerTabs,
  type HomeHeroProps
} from '@rspress/core/theme-original';
import HeroInteractive from './components/HeroInteractive.js';
import './index.css';

// Custom home layout with package manager tabs
function HomeLayout() {
  return (
    <BasicHomeLayout
      afterHeroActions={
        <div
          className="rp-doc"
          style={{ width: '100%', maxWidth: 475, margin: '-1rem 0' }}
        >
          <PackageManagerTabs
            command={{
              npm: 'npm i @kitajs/html @kitajs/ts-html-plugin',
              yarn: 'yarn add @kitajs/html @kitajs/ts-html-plugin',
              pnpm: 'pnpm add @kitajs/html @kitajs/ts-html-plugin',
              bun: 'bun add @kitajs/html @kitajs/ts-html-plugin'
            }}
          />
        </div>
      }
    />
  );
}

// Custom home hero with interactive component
const HomeHero = ({ image: _, ...otherProps }: HomeHeroProps) => {
  return <BasicHomeHero image={<HeroInteractive />} {...otherProps} />;
};

// Export customizations
export * from '@rspress/core/theme-original';
export { HomeHero, HomeLayout };
