import {
  HomeHero as BasicHomeHero,
  HomeLayout as BasicHomeLayout,
  Layout as BasicLayout,
  PackageManagerTabs,
  type HomeHeroProps
} from '@rspress/core/theme-original';
import { Banner } from './components/Banner.js';
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

// Global layout with dismissible pre-release banner
function Layout() {
  return (
    <>
      <Banner />
      <BasicLayout />
    </>
  );
}

// Export customizations
export * from '@rspress/core/theme-original';
export { HomeHero, HomeLayout, Layout };
