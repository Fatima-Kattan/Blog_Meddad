import React from 'react';
import styles from './rightSidebar.module.css';

function RightSidebar() {
  return (
      <div className={styles.sidebarSection}>
        <h3>Suggested Friends</h3>
        <div>
          {/* list of friends from api  */}
        </div>
      </div>
  );
}

export default RightSidebar;