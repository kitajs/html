import './index.css';
import {
  HomeHero as BasicHomeHero,
  type HomeHeroProps
} from '@rspress/core/theme-original';
import HeroInteractive from './components/HeroInteractive';

// Custom home hero with interactive component
const HomeHero = ({ image: _, ...otherProps }: HomeHeroProps) => {
  return <BasicHomeHero image={<HeroInteractive />} {...otherProps} />;
};

// Export customizations
export { HomeHero };
export * from '@rspress/core/theme-original';
