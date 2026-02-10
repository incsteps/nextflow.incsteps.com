<template>
  <div class="container">
    <div class="main">
      <div class="heading">
        <div class="chat-button"
             data-cal-link="jagedn/incsteps"
             data-cal-namespace="incsteps"
             data-cal-config="{&quot;layout&quot;:&quot;month_view&quot;,&quot;useSlotsViewOnSmallScreen&quot;:&quot;true&quot;}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Book a meeting</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.chat-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--vp-c-brand); /* Usa el color principal de VitePress */
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.chat-button:hover {
  opacity: 0.9;
  text-decoration: none !important;
}

/* Ajuste para modo oscuro si es necesario */
:deep(.dark) .chat-button {
  background-color: var(--vp-c-brand-light);
}

.hero-chat-wrapper {
  display: flex;
  justify-content: left;
  margin-top: 24px;
}
</style>
<script setup lang="ts">
</script>
