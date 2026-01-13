import React from 'react'
import { HiBell } from 'react-icons/hi'
import  styles  from './notificationIcon.module.css'

function NotificationIcon() {
    return (
        <div>
            <div className={styles.notificationWrapper}>
                <button className={styles.iconButton} aria-label="Notifications">
                    <HiBell size={22} />
                    <span className={styles.notificationBadge}>5</span>
                </button>
            </div>
        </div>
    )
}

export default NotificationIcon
