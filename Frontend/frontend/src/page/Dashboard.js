import React from "react";
import styles from "./Dashboard.module.css";
import Menu from "../components/Menu";

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
        <Menu />
      {/* Page Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>DASHBOARD</h1>
        </div>
        <div className={styles.center}>
          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Class</h3>
              <p>100</p>
            </div>
            <div className={styles.cardInforRight1}>
              <i class="fa-solid fa-book"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Class</h3>
              <p>100</p>
            </div>
            <div className={styles.cardInforRight2}>
              <i class="fa-solid fa-book"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Class</h3>
              <p>100</p>
            </div>
            <div className={styles.cardInforRight3}>
              <i class="fa-solid fa-book"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Class</h3>
              <p>100</p>
            </div>
            <div className={styles.cardInforRight4}>
              <i class="fa-solid fa-book"></i>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <h2>Sidebar Navigation Example</h2>
          <p>The sidebar width is set with <code>width: 25%</code>.</p>
          <p>The left margin of the page content is set to the same value.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
