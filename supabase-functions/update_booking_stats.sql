-- SUPABASE FUNCTION: Update Booking Stats
-- Handles customer stats, loyalty points, and analytics

CREATE OR REPLACE FUNCTION update_booking_stats(
  p_business_id UUID,
  p_customer_id UUID,
  p_appointment_id UUID,
  p_service_price INTEGER DEFAULT 5000,
  p_service_name TEXT DEFAULT 'Service',
  p_booking_source TEXT DEFAULT 'phone'
)
RETURNS JSON AS $$
DECLARE
  v_points_awarded INTEGER := 0;
  v_current_visits INTEGER := 0;
  v_analytics_id UUID;
  v_result JSON;
BEGIN
  -- Update customer visit stats
  UPDATE customers 
  SET 
    total_visits = COALESCE(total_visits, 0) + 1,
    last_visit = NOW()::DATE,
    updated_at = NOW()
  WHERE id = p_customer_id 
    AND business_id = p_business_id
  RETURNING COALESCE(total_visits, 1) INTO v_current_visits;

  -- Award loyalty points using existing function
  SELECT award_loyalty_points(
    p_business_id,
    p_customer_id,
    p_appointment_id,
    NULL, -- no payment_id yet
    p_service_price
  ) INTO v_points_awarded;

  -- Log analytics event
  INSERT INTO analytics_events (
    business_id, 
    event_type, 
    event_data,
    customer_id,
    appointment_id,
    created_at
  ) VALUES (
    p_business_id,
    'appointment_confirmed',
    json_build_object(
      'appointment_id', p_appointment_id,
      'service_name', p_service_name,
      'service_price', p_service_price,
      'booking_source', p_booking_source,
      'automation_triggered', true,
      'sms_sent', true,
      'email_sent', true,
      'points_awarded', v_points_awarded,
      'customer_visits', v_current_visits
    ),
    p_customer_id,
    p_appointment_id,
    NOW()
  ) RETURNING id INTO v_analytics_id;

  -- Build success response
  v_result := json_build_object(
    'success', true,
    'message', 'Booking stats updated successfully',
    'data', json_build_object(
      'customer_visits', v_current_visits,
      'points_awarded', v_points_awarded,
      'analytics_logged', v_analytics_id IS NOT NULL,
      'updated_at', NOW()
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to update booking stats'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;