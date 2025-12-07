import { Fragment } from "preact/jsx-runtime";
import { useState, useEffect, useCallback } from "preact/hooks";
import "./header.scss";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Sun, Moon, Hamburger, FaraazBiyabani } from "@icons/index";
import { setTheme, useTheme } from "src/store/theme";

export const Header = () => {
  const isBrowser = typeof window !== "undefined";
  const theme = useTheme();
  const [scrollDirection, setScrollDirection] = useState("");

  let supportPageOffset, isCSS1Compat;
  if (isBrowser) {
    supportPageOffset = window.scrollX !== undefined;
    isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
  }

  const getScrollY = useCallback(() => {
    if (!isBrowser) {
      return;
    }
    return supportPageOffset
      ? window.scrollY
      : isCSS1Compat
        ? document.documentElement.scrollTop
        : document.body.scrollTop;
  }, [isCSS1Compat, supportPageOffset, isBrowser]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const threshold = 100;

    let previousScrollY = getScrollY();
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = getScrollY();

      if (Math.abs(scrollY - previousScrollY) < threshold) {
        ticking = false;
        return;
      }
      setScrollDirection(
        scrollY > previousScrollY ? "scroll-down" : "scroll-up",
      );
      previousScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion && !reducedMotion.matches) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDirection, getScrollY, isBrowser]);

  let SwitchThemeIcon = theme === "light" ? Moon : Sun;

  const setNextTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <header id="nav-header" className={scrollDirection}>
        <Menu></Menu>
        <div className="header__content">
          <div className="logo">
            <a
              href="/"
              id="logo-link"
              draggable={false}
              aria-label="Link to home page"
            >
              <FaraazBiyabani />
            </a>
          </div>
          <div className="nav-links">
            <button
              title="Switch Theme"
              className="nav-link icon-button"
              onClick={setNextTheme}
              tabIndex={0}
            >
              <SwitchThemeIcon />
            </button>
            <a href="/#about" className="nav-link">
              About
            </a>
            <a href="/#projects" className="nav-link">
              Projects
            </a>
            <a href="/blog" className="nav-link">
              Blog
            </a>
            <a href="/resume" className="nav-link">
              Resume
            </a>
            <a href="/contact" className="nav-link">
              Contact
            </a>
          </div>
          <Menu as={Fragment}>
            <MenuButton as={Fragment} tabIndex={0}>
              <div className="nav-button">
                <Hamburger />
              </div>
            </MenuButton>
            <div className="nav-menu">
              <MenuItems transition portal={true} className="nav-menu-items">
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "item-active" : ""
                      } nav-menu-item icon-button`}
                      onClick={setNextTheme}
                      aria-label="Switch theme"
                    >
                      <SwitchThemeIcon />
                      <span className="icon-button-label">Switch Theme</span>
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      className={`${active ? "item-active" : ""} nav-menu-item`}
                      href={"/#about"}
                    >
                      About
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      className={`${active ? "item-active" : ""} nav-menu-item`}
                      href={"/#projects"}
                    >
                      Projects
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      className={`${active ? "item-active" : ""} nav-menu-item`}
                      href={"/blog"}
                    >
                      Blog
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      className={`${active ? "item-active" : ""} nav-menu-item`}
                      href={"/resume"}
                    >
                      Resume
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      className={`${active ? "item-active" : ""} nav-menu-item`}
                      href={"/contact"}
                    >
                      Contact
                    </a>
                  )}
                </MenuItem>
              </MenuItems>
            </div>
          </Menu>
        </div>
      </header>
    </>
  );
};
