/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useRef } from "react";

// react-router components
import { useLocation, Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import _ from "lodash";
// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
  setSimCards,
  setSimFilter,
  setAlert,
} from "context";
import routes from "routes";
import MDButton from "components/MDButton";
import readXlsxFile from "read-excel-file";
import { columnNames } from "layouts/tables/data/projectsTableData";
// import MDProgress from "components/MDProgress";
// import MDSnackbar from "components/MDSnackbar";
import { Backdrop, CircularProgress } from "@mui/material";
import { setOpenBackdrop } from "context";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import { handleRead } from "context/firebase";
import { handleWrite } from "context/firebase";
import { updateAmountCollection } from "context/firebase";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
    sidenavColor,
    openBackdrop,
    simCards,
    openAlert,
    variantAlert,
    contentAlert,
    database,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const [textSearch, setTextSearch] = useState("");
  const inputFileRef = useRef(null);

  const handleChangeFile = () => {
    setOpenBackdrop(dispatch, true);
    readXlsxFile(inputFileRef.current.files[0], { sheet: "ALL -Thuê Bao" })
      .then((rows) => {
        const columns = [];

        rows[1].forEach((column, index) => {
          if (columnNames.includes(column)) {
            columns.push({
              column,
              index,
            });
          }
        });

        const tablesRows = rows.map((row) => {
          const object = {};
          row.forEach((column, index) => {
            columns.forEach((i) => {
              if (i.index === index) {
                if (i.column === columnNames[6]) {
                  object[i.column] = new Date(column).toLocaleDateString("vi-VN").toString();
                } else {
                  object[i.column] = column ? `${column}` : "";
                }
              }
            });
          });
          return object;
        });
        setSimCards(dispatch, tablesRows.slice(2));
        setSimFilter(dispatch, textSearch);
        setOpenBackdrop(dispatch, false);
        setAlert(dispatch, {
          isOpen: true,
          variant: "success",
          content: "Thành công!",
        });
        updateSimData(tablesRows.slice(2));
      })
      .catch((e) => {
        setOpenBackdrop(dispatch, false);
        setAlert(dispatch, {
          isOpen: true,
          variant: "error",
          content: "Lỗi định dạng file!",
        });
      });
  };

  const handleOpenInput = () => {
    inputFileRef.current.click();
  };

  async function updateSimData(data) {
    const smallData = _.chunk(data, 4000);
    smallData.forEach((sm, index) => {
      sm.forEach((i) => {
        if (i["THUÊ BAO"] !== "") {
          handleWrite(index, i["THUÊ BAO"], i);
        }
      });
    });
    updateAmountCollection(smallData.length);

    const invalidData = database.filter((data) => !simCards.includes(data));
    invalidData.forEach((i) => {
      if (i["THUÊ BAO"] !== "") {
        new Array(smallData.length).fill(null).forEach((_, index) => {
          handleDelete(index, i["THUÊ BAO"]);
        });
      }
    });
  }

  useEffect(() => {
    setSimFilter(dispatch, textSearch);
  }, [textSearch]);

  useEffect(() => {
    setOpenBackdrop(dispatch, false);
  }, [simCards]);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  // const renderMenu = () => (
  //   <Menu
  //     anchorEl={openMenu}
  //     anchorReference={null}
  //     anchorOrigin={{
  //       vertical: "bottom",
  //       horizontal: "left",
  //     }}
  //     open={Boolean(openMenu)}
  //     onClose={handleCloseMenu}
  //     sx={{ mt: 2 }}
  //   >
  //     <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
  //     <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
  //     <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
  //   </Menu>
  // );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const title = routes.find((i) => i.route.split("/")[1] === route[route.length - 1])?.name;

  useEffect(() => {
    if (openAlert) {
      const idTimeout = setTimeout(() => {
        setAlert(dispatch, {
          isOpen: false,
          variant: "",
          content: "",
        });
      }, 3000);

      return () => {
        clearTimeout(idTimeout);
      };
    }
  }, [openAlert]);

  return (
    <>
      {openAlert && (
        <MDAlert color={variantAlert} dismissible>
          <MDTypography variant="body2" color="white">
            {contentAlert}
          </MDTypography>
        </MDAlert>
      )}

      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
      >
        <Toolbar sx={(theme) => navbarContainer(theme)}>
          <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
            <Breadcrumbs icon="home" title={title || ""} route={route} light={light} />
          </MDBox>
          {isMini ? null : (
            <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
              <MDBox pr={1}>
                <MDInput
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  label="Tìm kiếm"
                />
              </MDBox>
              <MDBox px={1}>
                <input
                  style={{ display: "none" }}
                  type="file"
                  ref={inputFileRef}
                  onChange={handleChangeFile}
                />
                <MDButton onClick={handleOpenInput} color={sidenavColor}>
                  Nhập
                </MDButton>
              </MDBox>

              <Backdrop
                sx={{ color: sidenavColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
                onClick={() => setOpenBackdrop(dispatch, false)}
              >
                <CircularProgress color="inherit" />
              </Backdrop>

              <MDBox color={light ? "white" : "inherit"}>
                {/* <Link to="/authentication/sign-in/basic">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link> */}
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarMobileMenu}
                  onClick={handleMiniSidenav}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleConfiguratorOpen}
                >
                  <Icon sx={iconsStyle}>settings</Icon>
                </IconButton>
                {/* <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton> */}
                {/* {renderMenu()} */}
              </MDBox>
            </MDBox>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}

// Setting default values for the props of DashboardNavbar
// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
